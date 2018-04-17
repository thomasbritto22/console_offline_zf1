<?php
require_once ("../library/AWS/aws.phar");
use Aws\Common\Aws;
use Aws\Common\Enum\Region;
$seconds = 0;
set_time_limit($seconds);

$service = 'AWS';
$uploadDir = '/custom_files';
$filepath = $argv[1];
$siteId = $argv[2];
$path_parts = pathinfo($filepath);
$filename = $path_parts['basename'];
$filebasename = $path_parts['filename'];
echo '$' . $filename . ':Started';

// Instantiate the S3 client with your AWS credentials and desired AWS region
$config = json_decode(file_get_contents('../application/configs/json/fileUpload.json'));
$aws = Aws::factory(array(
		'key'    => $config->aws->key,
		'secret' => $config->aws->secret,
		'region' => Region::US_EAST_1
));//print_r($this->aws);
$s3 = $aws->get('s3');
$client = $aws->get('ElasticTranscoder');
//print_r($client);exit;
$inputBucket   = 'InputBucketTranscoder';//.$this->sess->siteId;
$outputBucket  = 'OutputBucketTranscoder';//.$this->sess->siteId;
$roleName      = 'arn:aws:iam::817669084887:role/Role_Transcoder';
$policyName    = 'php-integ-transcoder-test-policy';
$pipelineName  = 'TranscoderPipeline';//.$this->sess->siteId;
$preset_mp4_name = 'Preset_MP4';
$preset_webm_name = 'Preset_WEBM';
$outPrefix = 'outputvideo'.$siteId.'/';
try{
	//print_r($client->listPipelines());exit;

	//  			echo "Before clear Bucket";
	//  			if($s3->doesBucketExist($inputBucket))
		//  				$s3->deleteBucket(array('Bucket'=>$inputBucket));

	//if(!$s3->doesBucketExist($inputBucket))
	$bucket = $s3->createBucket(array('Bucket'=>$inputBucket));
	//$filepath = '../data/AWS/wmvvideo.wmv';
	$response ='';
	echo '$' . $filename . ':Step0.05';
	error_log("Before File adding to bucket", 0);
	$response = $s3->putObject(array(
			'Bucket'     => $inputBucket,
			'Key'        => $filename,
			'SourceFile' => $filepath,
			'Metadata'   => array(
			)
	)
	);
	echo '$' . $filename . ':Step1';
	error_log("After File adding to bucket", 0);
	$s3->createBucket(array('Bucket'=>$outputBucket));
	$obj_keys = array();
	$objs = $s3->listObjects(array(
			'Bucket' => $outputBucket,
			'Delimiter'=>'/',
			'Prefix'=>$outPrefix
	)); //echo"<br/>";print_r($result['Contents']);exit;
	if(isset($objs['Contents']) && count($objs['Contents'])>0) {
		foreach($objs['Contents'] as $file){//print_r($file);
			$obj_keys[] = array('Key'=>$file['Key']);
		}
		$s3->deleteObjects(array('Bucket'=>$outputBucket,
				'Objects'=>$obj_keys
		));
	}

	error_log("Before create pipelines", 0);

	$pipelineStatus = 'NotFound';
	$pipelineId = null;
	$pipelines = array();
	$pipelines = $client->listPipelines();
	if(isset($pipelines['Pipelines'])){
		foreach($pipelines['Pipelines'] as $pipeline){
			if($pipeline['Name'] == $pipelineName){
				$pipelineStatus = 'Found';
				$pipelineId = $pipeline['Id'];
			}
		}
	}
	if($pipelineStatus == 'NotFound') {
		$transcode = $client->createPipeline(array(
				'Name'          => $pipelineName,
				'InputBucket'   => $inputBucket,
				'OutputBucket'  => $outputBucket,
				'Role'          => $roleName,
				'Notifications' => array(
						'Progressing' => '',
						'Completed'   => '',
						'Warning'     => '',
						'Error'       => ''
				)
		));
		$pipelineId = $transcode["Pipeline"]['Id'];
	}

	$presetMp4Status = 'NotFound';
	$presetWebmStatus = 'NotFound';
	$presetId_mp4 = null;
	$presetId_webm = null;
	$presets = array();
	$presets = $client->listPresets();
	foreach($presets['Presets'] as $preset){
		if($preset['Name'] == $preset_mp4_name){
			$presetMp4Status = 'Found';
			$presetId_mp4 = $preset['Id'];
		}
		if($preset['Name'] == $preset_webm_name){
			$presetWebmStatus = 'Found';
			$presetId_webm = $preset['Id'];
		}

	}
	error_log("Creating Presets", 0);
	echo '$' . $filename . ':Step2';
	if($pipelineId != null) {
		if($presetMp4Status == 'NotFound'){
			$preset_mp4 = $client->createPreset(array(
					'Name'=>$preset_mp4_name,
					'Description'=>'Preset Decs',
					'Container'=>"mp4",
					"Audio"=>array(
							"Codec"=>"AAC",
							"SampleRate"=>"auto",
							"BitRate"=>"96",
							"Channels"=>"auto",
					),
					"Video"=>array(
							"Codec"=>"H.264",
							"CodecOptions"=>array(
									"Profile"=>"main",
									"Level"=>"2.2",
									"MaxReferenceFrames"=>"3"
							),
							"KeyframesMaxDist"=>"240",
							"FixedGOP"=>"true",
							"BitRate"=>"auto",
							"FrameRate"=>"auto",
							"MaxWidth"=>"auto",
							"MaxHeight"=>"auto",
							"SizingPolicy"=>"Fit",
							"PaddingPolicy"=>"NoPad",
							"DisplayAspectRatio"=>"auto",
							//"Resolution"=>"auto",
							//"AspectRatio"=>"auto|1:1|4:3|3:2|16:9"
					),
					"Thumbnails"=>array(
							"Format"=>"jpg",
							"Interval"=>"2",
							"MaxWidth"=>"auto",
							"MaxHeight"=>"auto",
							"SizingPolicy"=>"Fit",
							"PaddingPolicy"=>"NoPad",
							//"Resolution"=>"width in pixelsxheight in pixels",
							//"AspectRatio"=>"auto|1:1|4:3|3:2|16:9"
					)
			));
			$presetId_mp4 = $preset_mp4["Preset"]["Id"];
		}
		if($presetWebmStatus == 'NotFound'){
			$preset_webm = $client->createPreset(array(
					'Name'=>$preset_webm_name,
					'Description'=>'Preset Decs',
					'Container'=>"webm",
					"Audio"=>array(
							"Codec"=>"vorbis",
							"SampleRate"=>"auto",
							"BitRate"=>"96",
							"Channels"=>"auto",
					),
					"Video"=>array(
							"Codec"=>"vp8",
							"CodecOptions"=>array(
									"Profile"=>"3",
									"Level"=>"2.2",
									"MaxReferenceFrames"=>"3"
							),
							"KeyframesMaxDist"=>"240",
							"FixedGOP"=>"true",
							"BitRate"=>"auto",
							"FrameRate"=>"auto",
							"MaxWidth"=>"auto",
							"MaxHeight"=>"auto",
							"SizingPolicy"=>"Fit",
							"PaddingPolicy"=>"NoPad",
							"DisplayAspectRatio"=>"auto",
							//"Resolution"=>"auto",
							//"AspectRatio"=>"auto|1:1|4:3|3:2|16:9"
					),
					"Thumbnails"=>array(
							"Format"=>"jpg",
							"Interval"=>"2",
							"MaxWidth"=>"auto",
							"MaxHeight"=>"auto",
							"SizingPolicy"=>"Fit",
							"PaddingPolicy"=>"NoPad",
							//Resolution"=>"width in pixelsxheight in pixels",
							//"AspectRatio"=>"auto|1:1|4:3|3:2|16:9"
					)
			));

			$presetId_webm = $preset_webm["Preset"]["Id"];
		}
		//print_r($presetId_webm);exit;

		$ext = $path_parts['extension'];
		$outputs = array();
		if($ext != 'mp4'){
			$outputs[] = array(
					"Key" => $filebasename.".mp4",
					"ThumbnailPattern" => $filebasename."-{count}",
					"Rotate" => "0",
					"PresetId" => $presetId_mp4
			);
		}
		if($ext != 'webm'){
			$outputs[] = array(
					"Key" => $filebasename.".webm",
					"ThumbnailPattern" => $filebasename."-{count}",
					"Rotate" => "0",
					"PresetId" => $presetId_webm,

			);
		}
		error_log("Before Creating Job", 0);
		echo '$' . $filename . ':Step3';
		if(count($outputs) > 0 && $s3->doesObjectExist($inputBucket,$filename)){
			$job = $client->createJob(
					array(
							'PipelineId' => $pipelineId,
							"Input"=>array(
									"Key"=> $filename,
									"FrameRate"=>"auto",
									"Resolution"=>"auto",
									"AspectRatio"=>"auto",
									"Interlaced"=>"auto",
									"Container"=>"auto"
							),
							"OutputKeyPrefix" => $outPrefix,
							"Outputs" => $outputs	//gangaram
					));


			$outputs = array();
			foreach($job["Job"]["Outputs"] as $outputFile){
				if(isset($outputFile['Key']) && $outputFile['Key'] !=''){
					$outputs[] = $outputFile;
				}

			}

			error_log("Read Job", 0);
			$result['Contents'] == array();
			$timeout = 1200;
			echo '$' . $filename . ':Step4';
			do{
				$jobStatus = '';
				$stopLoop = false;
				$jobStat = $client->readJob(
						array('Id' => $job['Job']['Id']));

				$jobStatus = $jobStat['Job']['Status'];
				error_log("Timeout : ".$timeout, 0);
				error_log("Status of job : ".$jobStatus, 0);

				if($jobStatus == 'Complete'){
					$result = $s3->listObjects(array(
							'Bucket' => $outputBucket,
							'Delimiter'=>'/',
							'Prefix'=>$outPrefix
					));
					if(isset($result['Contents']) && count($result['Contents'])>2) {
						error_log("Ready to download,Number of files".count($result['Contents']), 0);
						$imageCount = array();
						foreach($result['Contents'] as $file){
							$filenm = $file['Key'];
							$fileinfo = pathinfo("$filenm");//echo $fileinfo['basename'];
							$ext = $fileinfo['extension'];
							$nmImg = '';
							if($ext == 'jpg'){
								$lastPos = strrpos($fileinfo['filename'], '-');
								$nmImg = substr($fileinfo['filename'], 0,$lastPos);
								if(isset($imageCount[$nmImg]))
									$imageCount[$nmImg] = $imageCount[$nmImg]++;
								else
									$imageCount[$nmImg] = 1;
							}
							if(($ext == 'jpg' && $imageCount[$nmImg] < 5) || ($ext != 'jpg')){
								$resultget = $s3->getObject(array(
										'Bucket' => $outputBucket,
										'Key'    => $file['Key'],
										'SaveAs' => '/console/files/'.$fileinfo['basename']
								));
								error_log("After Donwloading File : ".$file['Key'] . ' ===== '.$fileinfo['basename'] .'==='.$nmImg, 0);
								if($imageCount[$nmImg] == 4)
									echo '$' . $filename . ':Step4.5';
							}
						}
						error_log("After All files are downloaded", 0);
						echo '$' . $filename . ':Complete';
						$stopLoop = true;
						$timeout = 0;
					}
				} else if($jobStatus == 'Canceled' || $jobStatus == 'Error'){
					$stopLoop = true;
					echo '$' . $filename . ':Error';
				}
				sleep(2);
				$timeout--;
			} while(!$stopLoop && $timeout > 0);
			error_log("Out of while", 0);

		}

		// Contains an EntityBody that wraps a file resource of /tmp/data.txt


	}
} catch(Exception $e){
	echo '$' . $filename . ':Error';
	error_log('Caught exception: '.  $e->getMessage(). "\n".debug_print_backtrace(), 0);die();
}